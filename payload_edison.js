var mraa = require("mraa");

//used to disable triggering a new scan when the scan is running
var scanning = false;

//timestamps to save
var start_time = (new Date()).getTime();
var last_timestamp = start_time;
var last_trigger = start_time;

//some variables for the echo
var counter = 0;
var pulsein = false;

var minimumRange = 0; //min 0m
var maximumRange = 400; //max 4m

// Instantiate two ULN2003XA motors
var Uln200xa_lib = require('jsupm_uln200xa');
var myUln200xa_obj = new Uln200xa_lib.ULN200XA(4096, 2, 3, 5, 6);
var myUln200xa_obj_2 = new Uln200xa_lib.ULN200XA(4096, 12, 9, 10, 11);

//general movement of a motor
moveMotor = function(device, direction, speed, steps)
{
    device.setSpeed(speed); //RPM
    if (direction == 'CCW') {
        device.setDirection(Uln200xa_lib.ULN200XA.DIR_CW);
    } else if (direction == 'CW') {
        device.setDirection(Uln200xa_lib.ULN200XA.DIR_CCW);        
    }
    device.stepperSteps(steps); //4096 = full rotation for 5RPM
};

//moves of a motor
moveL = function(steps) { moveMotor(myUln200xa_obj, 'CW', 7, steps); }
moveR = function(steps) { moveMotor(myUln200xa_obj, 'CCW', 7, steps); }
moveU = function(steps) { moveMotor(myUln200xa_obj_2, 'CCW', 7, steps); }
moveD = function(steps) { moveMotor(myUln200xa_obj_2, 'CW', 7, steps); }

//quitting functions
myUln200xa_obj.stop = function() { myUln200xa_obj.release(); };
myUln200xa_obj_2.stop = function() { myUln200xa_obj_2.release(); };

myUln200xa_obj.quit = function() {
	myUln200xa_obj = null;
	Uln200xa_lib.cleanUp();
	Uln200xa_lib = null;
	console.log("Exiting");
	process.exit(0);
};

myUln200xa_obj_2.quit = function()
{
	myUln200xa_obj_2 = null;
	Uln200xa_lib.cleanUp();
	Uln200xa_lib = null;
	console.log("Exiting");
	process.exit(0);
};

//program for a line-to-line scan movement
scan = function() {
    moveL(512);
    moveD(250);

    moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);
    moveU(48); moveL(1024);
    moveU(48); moveR(1024);


    moveD(518);
    moveL(512);

    setTimeout(function()
    {
        myUln200xa_obj.stop();
        myUln200xa_obj.quit();
        myUln200xa_obj_2.stop();
        myUln200xa_obj_2.quit();
        scanning = false;
    }, 2000);
}


// Load Grove module
var groveSensor = require('jsupm_grove');
var button = new groveSensor.GroveButton(7);
    
// Print message when exiting
process.on('SIGINT', function()
{
	console.log("Exiting...");
	process.exit(0);
});

var subscriber_pin_echo = new mraa.Gpio(8);
//var subscriber_pin_echo = new mraa.Pwm(9);
    subscriber_pin_echo.dir(mraa.DIR_IN);
//    subscriber_pin_echo.isr(mraa.EDGE_RISING, subscriberEventEchoRaising); //Subscribe to interrupt notifications from Arduino
//    subscriber_pin_echo.isr(mraa.EDGE_FALLING, subscriberEventEchoFalling); //Subscribe to interrupt notifications from Arduino
    
function subscriberEventTrig() {
	var trig_time = new Date();
	var measurement = trig_time.getTime() - last_timestamp;
	last_timestamp = trig_time.getTime();
	last_trigger = trig_time.getTime();
    console.log('Trigger: +' + measurement + 'ms');        
}

function subscriberEventEchoRaising() {
	console.log('raise');
	pulsein = true;
}

function subscriberEventEchoFalling() {
    var echo_time = new Date();
	var measurement = echo_time - last_trigger;
    console.log('fall');
    console.log(measurement);
    
    pulsein = false;
}

/********** Trigger ULTRA SOUND *************/
var notifier_pin = new mraa.Gpio(4);
notifier_pin.dir(mraa.DIR_OUT);

getDistance = function() {
	notifier_pin.write(0);
	setTimeout(function(){ notifier_pin.write(1); },2);
	setTimeout(function(){ notifier_pin.write(0); },12);
	setTimeout(function(){ subscriberEventTrig(); },20);
}

// Read the input and print, waiting one second between readings
function readButtonValue() {
    if(button.value() && !scanning){ scanning = true; scan(); }
    //if(button.value()) { getDistance(); }
}
/*
var jsupm_hcsr04_lib = require('jsupm_hcsr04');
//var ultrasound_sensor_interrupt = new jsupm_hcsr04_lib.interrupt();
//var ultrasound_sensor = new jsupm_hcsr04_lib.HCSR04 (4, 8, ultrasound_sensor_interrupt);

var ultrasound_sensor = new jsupm_hcsr04_lib.HCSR04 (4, 8, void function(){});
*/
setInterval(readButtonValue, 100);
/*
setInterval(function(){
	notifier_pin.write(0);
	setTimeout(function(){ notifier_pin.write(1); },2);
	setTimeout(function(){ notifier_pin.write(0); },12);
	setTimeout(function(){
	 	duration = pulseIn(subscriber_pin_echo, HIGH);
	 	distance = duration/58.2;
	 	if (distance >= maximumRange || distance <= minimumRange){
	 		distance = 'out of range';
	 	}
	 	console.log('distance: ' + distance);
	},12);
}, 60);
*/