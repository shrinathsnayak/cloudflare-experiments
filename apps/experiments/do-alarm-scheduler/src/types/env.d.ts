/// <reference types="@cloudflare/workers-types" />

export interface Env {
  SCHEDULER: DurableObjectNamespace;
}

export type ScheduleStatus = "scheduled" | "fired";

export type ScheduleRecord = {
  id: string;
  message: string;
  seconds: number;
  status: ScheduleStatus;
  scheduledFor: string;
  firedAt?: string;
};
