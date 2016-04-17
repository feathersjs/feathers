import feathers from '../feathers';
import express from './express';

export default function createApplication(... args) {
  return feathers(express(... args));
}

createApplication.version = '2.0.1';
