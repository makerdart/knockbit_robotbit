let cmd = ""
knockbit.onCmdReceived("lnp", function ({ cmd, args }) {
    knockbit.showLed(strip, args)
})
knockbit.onCmdReceived("set", function ({ cmd, args }) {
    knockbit.setMode("robotbit")
    knockbit.init_neopixel(4)
})
knockbit.onCmdReceived("ser", function ({ cmd, args }) {
    knockbit.servo(args)
})
knockbit.onCmdReceived("tt4", function ({ cmd, args }) {
    knockbit.tt4(args)
})
knockbit.onBluetoothDisconnected(function () {
    knockbit.clearLed(strip)
})
let strip: neopixel.Strip = null
cmd = ""
let args = ""
// 初始化knockbit，参数为true开启自动处理消息，否则需用参考手册使用onCmdReceived处理所有消息
knockbit.init(true)
// 初始化neopixel led
strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)
