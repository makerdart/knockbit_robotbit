
namespace knockbit {
    let pixelCount = 0;

    //% blockId=knock_init_neopixel
    //% block="初始化LED |LED个数 %ledCount"
    export function init_neopixel(ledCount: number) {
        pixelCount = ledCount;
        sendSuperMessage("lnp" + pixelCount);  // 设置lnp（neopixels数量）
    }

    let splitString = (splitOnChar: string, input: string) => {
        let result: string[] = []
        let count: number = 0
        let startIndex = 0
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == splitOnChar) {
                result[count] = input.substr(startIndex, index - startIndex)
                startIndex = index + 1
                count = count + 1
            }
        }
        if (startIndex != input.length)
            result[count] = input.substr(startIndex, input.length - startIndex)
        return result;
    }

    //% blockId=knock_neopixel_showLed
    //% block="显示LED | Strip %strip| 参数 %args"
    export function showLed(strip: neopixel.Strip, args: string) {
        //basic.showString(arg);
        if (strip == null || pixelCount == 0)
            return;

        if (args[0] == '-') { // 返回pixel灯数量
            bluetooth.uartWriteString("lnp" + pixelCount)
            return;
        }

        // 前6位rgb颜色，后面的是LED位置
        let ledstr = args.substr(6, args.length - 6);
        let rgb = parseInt("0x" + args.substr(0, 6));
        let leds = splitString("|", ledstr);
        //basic.showNumber(leds.length);
        for (let i = 0; i < leds.length; i++) {
            strip.setPixelColor(parseInt(leds[i]), rgb);
        }
        strip.show();
    }

    //% blockId=knock_neopixel_clearLed
    //% block="关闭LED | Strip %strip"
    export function clearLed(strip: neopixel.Strip) {
        if (strip != null) {    // 断开蓝牙时关闭led灯
            for (let i = 0; i < pixelCount; i++)
                strip.setPixelColor(i, 0);
            strip.show();
        }
    }

    // 以上是neopixel LED相关代码


    // 以下为4个电机

    // 电机速度
    let M1A_SPEED = 0, M2A_SPEED = 0, M1B_SPEED = 0, M2B_SPEED = 0;

    // 4个速度，分别为M1A,M2B,M2A,M1B,每个速度4位-255～0255

    //% blockId=knock_robot_tt4
    //% block="驱动电机tt4" |参数 %args"
    export function tt4(args: string) {
        if (args.length == 1) {
            if (args == "0") {
                M1A_SPEED = 0;
                M2B_SPEED = 0;
                M2A_SPEED = 0;
                M1B_SPEED = 0;
            }
            // =1 的时候按照上次的设置的速度继续运行
        }
        else {
            M1A_SPEED = parseInt(args.substr(0, 4));
            M2B_SPEED = parseInt(args.substr(4, 4));
            if (args.length >= 16) {
                M2A_SPEED = parseInt(args.substr(8, 4));
                M1B_SPEED = parseInt(args.substr(12, 4));
            }
        }

        motorRestore();
    }
    function doPause() {
        robotbit.MotorRun(robotbit.Motors.M1A, 0);
        robotbit.MotorRun(robotbit.Motors.M2B, 0);
        robotbit.MotorRun(robotbit.Motors.M2A, 0);
        robotbit.MotorRun(robotbit.Motors.M1B, 0);
    }

    function motorRestore() {
        robotbit.MotorRun(robotbit.Motors.M1A, M1A_SPEED);
        robotbit.MotorRun(robotbit.Motors.M2B, M2B_SPEED);
        robotbit.MotorRun(robotbit.Motors.M2A, M2A_SPEED);
        robotbit.MotorRun(robotbit.Motors.M1B, M1B_SPEED);
    }

    // 以下为舵机
    // 第一位为停止位，如果为1，则转动舵机后不断电，如果为0，则转动后断电
    // 第二位开始每4位为一个组，其中第一位为舵机编号，支持0-9共10个舵机，
    // 接下去3位为转动角度，0～990(一般为0～180)
    //% blockId=knock_robot_servo
    //% block="驱动舵机 ser |参数 %args"
    export function servo(args: string) {
        let stop = parseInt(args.substr(0, 1));
        if (args.length >= 5) {
            let index = parseInt(args.substr(1, 1));
            let degree = parseInt(args.substr(2, 3));
            robotbit.Servo(index, degree);
            if (stop) {
                basic.pause(50);
                setPwm(index + 7, 0, 0);// 舵机断电
            }
        }
        if (args.length >= 9) {
            let index = parseInt(args.substr(5, 1));
            let degree = parseInt(args.substr(6, 3));
            robotbit.Servo(index, degree);
            if (stop) {
                basic.pause(50);
                setPwm(index + 7, 0, 0);// 舵机断电
            }
        }
        if (args.length >= 13) {
            let index = parseInt(args.substr(9, 1));
            let degree = parseInt(args.substr(10, 3));
            robotbit.Servo(index, degree);
            if (stop) {
                basic.pause(50);
                setPwm(index + 7, 0, 0);// 舵机断电
            }
        }
        if (args.length >= 5) {
            basic.pause(20);
        }
    }
    const PCA9685_ADDRESS = 0x40
    const LED0_ON_L = 0x06
    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }
}