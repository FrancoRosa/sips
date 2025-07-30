const { execSync } = require("node:child_process");
const { usb, getDeviceList } = require("usb");
const timestamp = () => new Date().toLocaleString("sv");

const USER_NAME = "pi";
const EXT_DIR = "/media/usb";
const LOG_NAME = "/media/usb/sips_logs.txt";
const LOCAL_DIR = `/home/${USER_NAME}/sips_files`;

const print_log = (msg) => {
  try {
    const message = timestamp() + " - " + msg;
    console.log(message);
    execSync(`echo "${message}" >> ${LOG_NAME}`);
  } catch (error) {
    console.error("error printing to logs");
  }
};

let devices = getDeviceList();
console.log(devices.map((d) => d.deviceAddress));

usb.on("attach", (device) => {
  console.log(timestamp(), "attach usb");
  devices.push(device);
  mount();
});

usb.on("detach", (device) => {
  console.log(timestamp(), "detach usb");

  devices.splice(
    devices.findIndex((d) => d.deviceAddress === device.deviceAddress),
    1
  );
  mount();
});

const getDeviceName = () => {
  let rp = execSync("ls -l /dev/disk/by-uuid");
  rp = rp
    .toString()
    .split("\n")
    .filter((l) => l.includes("../../"));
  rp = rp.map((l) => l.split("../..")[1]).find((l) => l.includes("/sd"));
  console.log(rp);
  if (rp) {
    return "/dev" + rp;
  } else {
    return false;
  }
};

const mount = () => {
  setTimeout(() => {
    pendrive = false;
    if (
      devices.filter((d) => d.deviceDescriptor.bDeviceClass == 0).length == 1
    ) {
      console.log(timestamp(), "mounting device");
      const dev = getDeviceName();
      if (dev) {
        execSync(`sudo mkdir -p ${EXT_DIR}`);
        execSync(`sudo chown -R ${USER_NAME}:${USER_NAME} ${EXT_DIR}`);
        try {
          execSync(
            `sudo mount --no-mtab ${dev} ${EXT_DIR} -o uid=${USER_NAME},gid=${USER_NAME}`
          );
        } catch (error) {
          console.log(timestamp(), "already mounted");
          print_log("device mounted");
        }
        console.log(timestamp(), "device mounted");
        pendrive = true;

        try {
          console.log(execSync(`ls ${LOCAL_DIR}`).toString());
          console.log(`local sips exists`);
          console.log(execSync(`rsync -av ${LOCAL_DIR} ${EXT_DIR}`).toString());
          print_log("sync completed");
        } catch (error) {
          console.log("error saving files");
          print_log("device mounted");
        }
      }
    }
  }, 2000);
};
mount();
