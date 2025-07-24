const { execSync } = require("node:child_process");
const { usb, getDeviceList } = require("usb");
const crypto = require("crypto");

const timestamp = () => new Date().toLocaleString("sv");

const print_log = (msg) => {
  const log_name = "/media/usb/dips_logs.txt";
  const message = timestamp() + " - " + msg;
  console.log(message);
  execSync(`echo "${message}" >> ${log_name}`);
};

let devices = getDeviceList();
console.log(devices.map((d) => d.deviceAddress));

usb.on("attach", (device) => {
  console.log(timestamp(), "attach usb");
  devices.push(device);
  mount();
});

usb.on("detach", (device) => {
  console.log(timestamp(), "dettach usb");

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

const decryptObject = (encrypted) => {
  const key = "1dostrescuatrocincoseissieteocho";
  const { data, iv } = encrypted;
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    key,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(data, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString());
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
        execSync("sudo mkdir -p /media/usb");
        execSync("sudo chown -R pi:pi /media/usb");
        try {
          execSync(`sudo mount --no-mtab ${dev} /media/usb -o uid=pi,gid=pi`);
        } catch (error) {
          console.log(timestamp(), "already mounted");
          print_log("device mounted");
        }
        console.log(timestamp(), "device mounted");
        pendrive = true;
        let response;
        let payload;
        let decrypted;
        try {
          response = execSync("cat /media/usb/dips_settings.json");
          print_log("file found");
          payload = JSON.parse(response.toString());
        } catch (error) {
          print_log("no settings file found");
        }

        try {
          decrypted = decryptObject(payload);
          print_log("settings format accepted");

          print_log(JSON.stringify(decrypted));
          const settings = JSON.parse(
            execSync("cat /home/pi/dips/settings.json")
          );
          const { schedule, emails } = decrypted;
          settings.email.time = schedule;
          settings.email.receivers = emails;

          const newSettings = JSON.stringify(settings, null, 2);
          execSync(`echo '${newSettings}' > /home/pi/dips/settings.json`);
          try {
            execSync("sudo pm2 stop dips && sleep 5 && sudo pm2 start dips");
            print_log("settings updated");
          } catch (error) {
            print_log("settings not updated");
          }
        } catch (error) {
          print_log("settings format contains errors");
        }
      }
    }
  }, 2000);
};
mount();