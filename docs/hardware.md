# Hardware

The sensor node is a solar-powered ESP32 that reads a Modbus soil probe and a DHT11, then pushes readings to ThingSpeak over Wi-Fi. It ran unattended in a chilli plot, mounted on a steel pole at the edge of the field.

<table>
<tr>
<td width="50%"><img src="images/sensor-node-deployed.jpg" alt="Deployed node"></td>
<td width="50%"><img src="images/sensor-node-internals.jpg" alt="Enclosure internals"></td>
</tr>
<tr>
<td align="center"><em>Pole-mounted node with 10 W panel</em></td>
<td align="center"><em>Charge controller, battery pack and control board</em></td>
</tr>
</table>

## Bill of materials

| Component | Purpose |
|---|---|
| ESP32 DevKit (WROOM-32) | Sensor polling, Wi-Fi uplink, HTTP client |
| 7-in-1 soil probe (RS485/Modbus RTU) | N, P, K, moisture, soil temperature |
| DHT11 | Air temperature and humidity |
| MAX485 transceiver | TTL UART ↔ RS485 differential pair |
| LM2596 buck converter | Battery voltage → 5 V logic rail |
| PWM solar charge controller | Panel → battery charging and protection |
| 10 W polycrystalline panel | Power source |
| 3-cell 18650 pack | Overnight and low-light operation |
| IP-rated enclosure, aviation connector | Weatherproofing and field-serviceable probe cable |

The control board is hand-soldered perfboard rather than a fabricated PCB.

## Wiring

| Signal | ESP32 pin |
|---|---|
| RS485 RX | GPIO 16 |
| RS485 TX | GPIO 17 |
| MAX485 RE (receiver enable) | GPIO 22 |
| MAX485 DE (driver enable) | GPIO 23 |
| DHT11 data | GPIO 27 |

RE and DE are tied together in software: both are driven high to transmit a request frame, then low to receive the reply.

## Modbus register map

The probe is queried with standard Modbus RTU read-holding-register frames at 9600 baud, slave address `0x01`. The firmware stores these as pre-computed byte arrays with fixed CRCs:

| Measurement | Register | Request frame |
|---|---|---|
| Moisture | `0x0012` | `01 03 00 12 00 01 24 0F` |
| Nitrogen | `0x001E` | `01 03 00 1E 00 01 E4 0C` |
| Phosphorus | `0x001F` | `01 03 00 1F 00 01 B5 CC` |
| Potassium | `0x0020` | `01 03 00 20 00 01 85 C0` |

Each reply is a 7-byte frame; the firmware reads the value from byte index 4. Requests are spaced 250 ms apart to let the bus settle between transactions.

## ThingSpeak channel mapping

Readings were published to channel `2693814` via HTTP GET, one update every ~5 seconds.

| Field | Measurement |
|---|---|
| `field2` | Soil temperature (°C) |
| `field3` | Nitrogen (mg/kg) |
| `field4` | Phosphorus (mg/kg) |
| `field5` | Potassium (mg/kg) |
| `field6` | Soil moisture (%) |
| `field7` | Air humidity (%) |
| `field8` | Air temperature (°C) |

![ThingSpeak dashboard](images/thingspeak-dashboard.png)

**The channel has been retired** and no longer serves data.

## Known hardware limitations

- **Soil temperature was derived, not measured.** The firmware computes it as `air_temperature − 5 °C`. The probe exposes a temperature register, but it was not wired into the polling loop. Every soil-temperature value in the dataset and in the yield model's input carries this approximation.
- **No offline buffering.** Readings taken while Wi-Fi was unavailable were discarded rather than queued, so the logs have gaps.
- **`SoftwareSerial` on ESP32.** The sketch uses `SoftwareSerial` where the ESP32's second hardware UART would have been more robust at 9600 baud.
- **Blocking delays.** The main loop is paced with `delay()`, so the node cannot service its web endpoint during a sensor read cycle.
- **No watchdog or sleep.** The node runs continuously rather than deep-sleeping between samples, which costs battery life unnecessarily for a sensor sampled every few seconds.

## Firmware

The Arduino sketch is not committed to this repository — it contains Wi-Fi credentials and a ThingSpeak write key, and the deployment it targets no longer exists.

**[View the firmware source →](https://docs.google.com/document/d/1QhVWsExaii1ppKIEPD_oWN_gtc14UCqahXl2J7_BAZU/edit)**

Dependencies: `WiFi.h`, `HTTPClient.h`, `WebServer.h`, `SoftwareSerial.h`, and the Adafruit `DHT` library.
