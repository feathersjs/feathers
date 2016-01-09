import feathers from '../feathers';
import express from './express';

export default function() {
  return feathers(express());
}
