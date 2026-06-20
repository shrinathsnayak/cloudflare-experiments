import type { HashAlgorithm } from "../constants/algorithms";

export type HashResponse = {
  algorithm: HashAlgorithm;
  hash: string;
  inputLength: number;
};
