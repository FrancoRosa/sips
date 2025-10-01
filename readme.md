# kn - Printer

> The goal of this project is to replace old printers with a new aproach

## Requirements

node 18

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y
```

## Virtual port for testing

```bash
socat -d -d PTY,link=/tmp/ttyV0,raw,echo=0 PTY,link=/tmp/ttyV1,raw,echo=0
```
