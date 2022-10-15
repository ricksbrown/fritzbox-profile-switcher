# FritzBox Profile Switcher

Remotely set an Access Profile on a network device in a FritzBox network.

## Installation

```
git clone https://github.com/ricksbrown/fritzbox-profile-switcher.git
cd fritzbox-profile-switcher
npm install
```

## CLI Usage

```
fbps.js [-s] [--url URL] --password PASSWORD [DEVICE=PROFILE [DEVICE=PROFILE ...]]

positional arguments:
DEVICE=PROFILE       Desired device to profile mapping

optional arguments:
--url URL            The URL of your Fritz!Box; default: http://fritz.box
--password PASSWORD  Login password, base64 encoded
-s                   Show the browser (don't run headless).
```

## Example

```bash
# Sets the the device "Sarah-Desktop" to profile named "KidsDevices"
./fbps.js --password U2NyaXB0S2lkZGll 'Sarah-Desktop=KidsDevices'
```

## Schedule

I run this from cron:

```
30 16 * * MON-FRI /path/to/fritzbox-profile-switcher/fbps.js --password U2NyaXB0S2lkZGll 'Sarah-Desktop=Standard'
00 11 * * SAT-SUN /path/to/fritzbox-profile-switcher/fbps.js --password U2NyaXB0S2lkZGll 'Sarah-Desktop=Standard'
00 2 * * * /path/to/fritzbox-profile-switcher/fbps.js --password U2NyaXB0S2lkZGll 'Sarah-Desktop=KidsDevices'
```

## Note
 - The official Python API does not allow you to do this.
 - Nor does the unofficial API.
 - Other options I found were non-trivial to update to new FritzBox firmware.
