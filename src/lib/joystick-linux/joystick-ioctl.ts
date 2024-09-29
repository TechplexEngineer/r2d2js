// from joystick.h in linux kernel

import ioctl from 'ioctl';

// extracted via test program: https://gist.github.com/TechplexEngineer/8c2386f742bda19149d185126b5af2c0
export const IOCTL = {
	JSIOCGVERSION: 0x80046a01,
	JSIOCGAXES: 0x80016a11,
	JSIOCGBUTTONS: 0x80016a12,
	JSIOCGNAME128: 0x80806a13,
	JSIOCGNAME256: 0x81006a13,
	JSIOCGAXMAP: 0x80406a32,
	JSIOCGBTNMAP_LARGE: 0x84006a34
};

export const ABS_MAX = 63; // from joystick.c in linux kernel
export const AXMAP_SIZE = ABS_MAX + 1;
export const BTNMAP_SIZE = 512; // from joystick.c in linux kernel
export const BTN_MISC = 256; // from joystick.c in linux kernel

// From jstest.c in debian joystick package
// https://salsa.debian.org/debian/joystick/-/blob/master/utils/jstest.c?ref_type=heads#L53-58
// prettier-ignore
export const axis_names = [
  "X", "Y", "Z", "Rx", "Ry", "Rz", "Throttle", "Rudder", 
    "Wheel", "Gas", "Brake", "?", "?", "?", "?", "?",
    "Hat0X", "Hat0Y", "Hat1X", "Hat1Y", "Hat2X", "Hat2Y", "Hat3X", "Hat3Y",
    "?", "?", "?", "?", "?", "?", "?", 
];

// From jstest.c in debian joystick package
// https://salsa.debian.org/debian/joystick/-/blob/master/utils/jstest.c?ref_type=heads#L61-88
// prettier-ignore
export const button_names = [
  /* BTN_0, 0x100, to BTN_9, 0x109 */
  "Btn0", "Btn1", "Btn2", "Btn3", "Btn4", "Btn5", "Btn6", "Btn7", "Btn8", "Btn9",
  /* 0x10a to 0x10f */
  "?", "?", "?", "?", "?", "?",
  /* BTN_LEFT, 0x110, to BTN_TASK, 0x117 */
  "LeftBtn", "RightBtn", "MiddleBtn", "SideBtn", "ExtraBtn", "ForwardBtn", "BackBtn", "TaskBtn",
  /* 0x118 to 0x11f */
  "?", "?", "?", "?", "?", "?", "?", "?",
  /* BTN_TRIGGER, 0x120, to BTN_PINKIE, 0x125 */
  "Trigger", "ThumbBtn", "ThumbBtn2", "TopBtn", "TopBtn2", "PinkieBtn",
  /* BTN_BASE, 0x126, to BASE6, 0x12b */
  "BaseBtn", "BaseBtn2", "BaseBtn3", "BaseBtn4", "BaseBtn5", "BaseBtn6",
  /* 0x12c to 0x12e */
  "?", "?", "?",
  /* BTN_DEAD, 0x12f */
  "BtnDead",
  /* BTN_A, 0x130, to BTN_TR2, 0x139 */
  "BtnA", "BtnB", "BtnC", "BtnX", "BtnY", "BtnZ", "BtnTL", "BtnTR", "BtnTL2", "BtnTR2",
  /* BTN_SELECT, 0x13a, to BTN_THUMBR, 0x13e */
  "BtnSelect", "BtnStart", "BtnMode", "BtnThumbL", "BtnThumbR",
  /* 0x13f */
  "?",
  /* Skip the BTN_DIGI range, 0x140 to 0x14f */
  "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?", "?",
  /* BTN_WHEEL / BTN_GEAR_DOWN, 0x150, to BTN_GEAR_UP, 0x151 */
  "WheelBtn", "Gear up",
];

export const getDriverVersion = (fd: number) => {
	const buffer = Buffer.alloc(4);

	var ret = ioctl(fd, IOCTL.JSIOCGVERSION, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const version = buffer.readUInt32LE();

	return `${version >> 16}.${(version >> 8) & 0xff}.${version & 0xff}`;
};

export const getNumAxes = (fd: number) => {
	const buffer = Buffer.alloc(4);

	var ret = ioctl(fd, IOCTL.JSIOCGAXES, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const numAxes = buffer.readUInt8(0);

	return numAxes;
};

export const getNumButtons = (fd: number) => {
	const buffer = Buffer.alloc(4);

	var ret = ioctl(fd, IOCTL.JSIOCGBUTTONS, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const numButtons = buffer.readUInt8(0);

	return numButtons;
};

export const getDeviceName = (fd: number) => {
	const buffer = Buffer.alloc(256);

	var ret = ioctl(fd, IOCTL.JSIOCGNAME256, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const name = buffer.toString();

	return name;
};

export const getAxisMap = (fd: number) => {
	const buffer = Buffer.alloc(AXMAP_SIZE);

	var ret = ioctl(fd, IOCTL.JSIOCGAXMAP, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const axes = getNumAxes(fd);

	const map: Record<number, string> = {};

	for (let i = 0; i < axes; i++) {
		map[i] = axis_names[buffer.readUInt8(i)];
	}

	return map;
};

export const getButtonMap = (fd: number) => {
	const buffer = Buffer.alloc(BTNMAP_SIZE * 2);

	// the IOCTL.JSIOCGBTNMAP_LARGE is only available on newer kernels
	// Here is what JSTEST does to support older kernels https://salsa.debian.org/debian/joystick/-/blob/master/utils/axbtnmap.c?ref_type=heads#L37-53
	var ret = ioctl(fd, IOCTL.JSIOCGBTNMAP_LARGE, buffer);
	if (ret < 0) {
		throw new Error('ioctl failed');
	}

	const buttons = getNumButtons(fd);

	const map: Record<number, string> = {};

	for (let i = 0; i < buttons * 2; i += 2) {
		map[i / 2] = button_names[buffer.readInt16LE(i) - BTN_MISC];
	}

	return map;
};
