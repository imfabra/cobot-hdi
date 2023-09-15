from bleak import BleakClient
import asyncio
# Dirección MAC del dispositivo ESP32
esp32_address = "84:F7:03:43:04:02"  # Reemplaza con la dirección MAC real

# UUID del servicio y característica
service_uuid = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E"
characteristic_uuid = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E"

class BT:
    def __init__(self) -> None:
        pass
    async def send_data(self,data=""):
        async with BleakClient(esp32_address) as client:     
            # Enviar los datos al dispositivo ESP32
            await client.write_gatt_char(characteristic_uuid, data.encode())
            

    def run(self,data):
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.send_data(data))
