import BitSet from 'bitset.js';

const bitsPerInt = 31;

BitSet.prototype['msb'] = function msb() {
  for (let i = this['length']; i--;) {
    let v = this[i];
    let c = -1;

    if (v) {
      while (v) {
        v >>>= 1;
        c++;
      }
      return bitsPerInt * i + c;
    }
  }
  return 0;
};

BitSet.prototype['lsb'] = function lsb() {
  for (let j = 0, i = this['length']; j < i; j++) {
    let v = this[j];
    let c = -1;

    if (v) {
      let bit = (v & -v);
      while (bit) {
        bit >>>= 1;
        c++;
      }
      return bitsPerInt * j + c;
    }
  }
  return 0;
};

export default BitSet;
