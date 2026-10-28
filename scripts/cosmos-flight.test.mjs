import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FlightController } from '../src/cosmos/FlightController.ts';

const tick = (flight, seconds) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 120) flight.update(1 / 120);
};

test('wheel is reversible, decays to a stop, and clamps the start boundary', () => {
  const flight = new FlightController(328);
  flight.wheel(180); tick(flight, 2);
  assert.ok(flight.distance > 3);
  assert.equal(flight.velocity, 0);
  const before = flight.distance;
  flight.wheel(-90); tick(flight, 2);
  assert.ok(flight.distance < before);
  flight.wheel(-240); tick(flight, 2);
  assert.equal(flight.distance, 0);
  assert.equal(flight.velocity, 0);
});

test('wheel delta modes produce equivalent input and invalid input is ignored', () => {
  const flights = [new FlightController(328), new FlightController(328), new FlightController(328)];
  flights[0].wheel(160); flights[1].wheel(10, 1); flights[2].wheel(.2, 2, 800);
  flights.forEach((flight) => { flight.wheel(NaN); tick(flight, 1); });
  assert.equal(flights[0].distance, flights[1].distance);
  assert.equal(flights[0].distance, flights[2].distance);
});

test('exploration discards wheel and held input; resume preserves position', () => {
  const flight = new FlightController(328);
  flight.wheel(200); tick(flight, .25);
  assert.equal(flight.explore(), true);
  const distance = flight.distance;
  flight.wheel(400); flight.hold(1); tick(flight, 3);
  assert.equal(flight.distance, distance);
  assert.equal(flight.velocity, 0);
  flight.resume(); flight.wheel(400); tick(flight, 1.5);
  assert.equal(flight.mode, 'flight');
  assert.equal(flight.distance, distance);
  flight.wheel(100); tick(flight, 1);
  assert.ok(flight.distance > distance);
});

test('black hole resets all input once behind the fade and permits another voyage', () => {
  const flight = new FlightController(328);
  flight.flightProgress = .999; flight.wheel(240); tick(flight, .1);
  assert.equal(flight.mode, 'departing');
  for (let i = 0; i < 360 && flight.mode !== 'flight'; i++) {
    flight.wheel(240); flight.hold(1); flight.update(1 / 120);
  }
  assert.equal(flight.mode, 'flight');
  assert.equal(flight.distance, 0);
  assert.equal(flight.velocity, 0);
  assert.equal(flight.transitionOpacity, 0);
  assert.equal(flight.loops, 1);
  tick(flight, 3);
  assert.equal(flight.loops, 1);
  flight.wheel(100); tick(flight, 1);
  assert.ok(flight.distance > 0);
});

test('manual restart ignores repeated trigger and fades before resetting', () => {
  const flight = new FlightController(328);
  flight.flightProgress = .5; flight.restart(); tick(flight, .4);
  flight.restart();
  assert.equal(flight.flightProgress, .5);
  assert.ok(flight.transitionOpacity > 0 && flight.transitionOpacity < 1);
  tick(flight, 2);
  assert.equal(flight.distance, 0);
  assert.equal(flight.loops, 1);
});

test('distance integration is independent of frame rate', () => {
  const slow = new FlightController(328), fast = new FlightController(328);
  slow.wheel(200); fast.wheel(200);
  for (let i = 0; i < 60; i++) slow.update(1 / 30);
  for (let i = 0; i < 240; i++) fast.update(1 / 120);
  assert.ok(Math.abs(slow.distance - fast.distance) < .001);
});
