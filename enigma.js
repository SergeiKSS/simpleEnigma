const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

class Rotor {
  wires = {};
  inverseWires = {};
  nextRotor = null;
  turnoverCountdown = 26;
  innerRingPosition = 0;

  constructor(wiringTable) {
    for (let i = 0; i < LETTERS.length; i++) {
      this.wires[LETTERS[i]] = wiringTable[i];
      this.inverseWires[wiringTable[i]] = LETTERS[i];
    }
  }

  setInitialPosition(initialPosition) {
    let letterCode = initialPosition.charCodeAt(0) - 'A'.charCodeAt(0);
    let nextRotor = this.nextRotor;
    this.nextRotor = null;

    for (let i = 0; i < letterCode; i++) {
      this.step();
    }

    this.nextRotor = nextRotor;
  };

  setInnerPosition(innerRingPosition) {
    let numberOfSteps = innerRingPosition.charCodeAt(0) - 'A'.charCodeAt(0);

    for (let i = 0; i < 26 - numberOfSteps; i++) {
      this.stepWires();
      this.updateInverseWires();
      this.innerRingPosition += 1;
    }
  };

  setNextRotor(rotor) {
    this.nextRotor = rotor;
  };

  setTurnoverLetter(letter) {
    this.turnoverCountdown = letter.charCodeAt(0) - 'A'.charCodeAt(0);

    if (this.turnoverCountdown === 0)
      this.turnoverCountdown = 26;
  };

  addWire(letter1, letter2) {
    this.wires[letter1] = letter2;
  };

  encode(letter, inverse) {
    let letterCode = letter.charCodeAt(0) - 'A'.charCodeAt(0);

    if (inverse) {
      var offsetLetterCode = (letterCode + this.innerRingPosition) % LETTERS.length;
      if (offsetLetterCode < 0) offsetLetterCode += 26;

      return this.inverseWires[String.fromCharCode('A'.charCodeAt(0) + offsetLetterCode)];
    } else {
      var outputLetterCode = this.wires[letter].charCodeAt(0) - 'A'.charCodeAt(0);

      offsetLetterCode = (outputLetterCode - this.innerRingPosition) % LETTERS.length;
      if (offsetLetterCode < 0) offsetLetterCode += 26;

      return String.fromCharCode('A'.charCodeAt(0) + offsetLetterCode);
    }
  };

  step() {
    this.stepWires();
    this.updateInverseWires();
    this.turnover();
    this.innerRingPosition += 1;
  };

  stepWires() {
    let newWires = {};
    let currentLetter;
    let nextLetter;

    for (let i = 0; i < LETTERS.length; i++) {
      currentLetter = LETTERS[i];
      nextLetter = LETTERS[(i + 1) % LETTERS.length];
      newWires[currentLetter] = this.wires[nextLetter];
    }

    this.wires = newWires;
  };

  updateInverseWires() {
    for (let i = 0; i < LETTERS.length; i++) {
      let letter = LETTERS[i];
      let encodedLetter = this.wires[letter];
      this.inverseWires[encodedLetter] = letter;
    }
  };

  turnover() {
    this.turnoverCountdown -= 1;

    if (this.turnoverCountdown === 0) {
      if (this.nextRotor)
        this.nextRotor.step();
      this.turnoverCountdown = 26;
    }
  };
};

let RotorI = function () {
  let rotor = new Rotor('EKMFLGDQVZNTOWYHXUSPAIBRCJ');
  rotor.setTurnoverLetter('R');
  return rotor;
};

let RotorII = function () {
  let rotor = new Rotor('AJDKSIRUXBLHWTMCQGZNPYFVOE');
  rotor.setTurnoverLetter('F');
  return rotor;
};

let RotorIII = function () {
  let rotor = new Rotor('BDFHJLCPRTXVZNYEIWGAKMUSQO');
  rotor.setTurnoverLetter('W');
  return rotor;
};

let RotorIV = function () {
  let rotor = new Rotor('ESOVPZJAYQUIRHXLNFTGKDCMWB');
  rotor.setTurnoverLetter('K');
  return rotor;
};

let RotorV = function () {
  let rotor = new Rotor('VZBRGITYUPSDNHLXAWMJQOFECK');
  rotor.setTurnoverLetter('A');
  return rotor;
};


class Reflector {
  reflectionTable = {};

  constructor() {
    for (let i = 0; i < LETTERS.length; i++) {
      this.reflectionTable[LETTERS[i]] = LETTERS[i];
    }
  }

  setReflectionTable(reflectionTable) {
    let newReflectionTable = {};
  
    for (let i = 0; i < LETTERS.length; i++) {
      let input = LETTERS[i];
      let output = reflectionTable[i];
      newReflectionTable[input] = output;
    }
  
    this.reflectionTable = newReflectionTable;
  };
  
  encode(letter) {
    return this.reflectionTable[letter];
  };

}

let ReflectorB = function () {
  let reflector = new Reflector();
  reflector.setReflectionTable('YRUHQSLDPXNGOKMIEBFZCWVJAT');
  return reflector;
};

let ReflectorC = function () {
  let reflector = new Reflector();
  reflector.setReflectionTable('FVPJIAOYEDRZXWGCTKUQSBNMHL');
  return reflector;
};

class Machine {
  debug = false;
  rotors = null;
  reflector = null;

  log(message) {
    if (this.debug) {
      console.log(message);
    }
  }

  setRotors(leftRotor, middleRotor, rightRotor) {
    this.rotors = [rightRotor, middleRotor, leftRotor];
    this.rotors[0].setNextRotor(this.rotors[1]);
    this.rotors[1].setNextRotor(this.rotors[2]);

    this.log('Machine rotors table');

    for (let i = 0; i < this.rotors.length; i++) {
      this.log('Rotor ' + i + ' table');
      this.log(this.rotors[i].wires);
      this.log('');
    }
  };

  setReflector(reflector) {
    this.reflector = reflector;

    this.log('Machine reflector table');
    this.log(this.reflector.reflectionTable);
    this.log('');
  };

  encode(letter) {
    if (this.rotors[1].turnoverCountdown === 1 &&
      this.rotors[2].turnoverCountdown === 1) {
      this.rotors[1].step();
    }

    // Update rotor position after encoding
    this.rotors[0].step();

    this.log('Machine encoding');
    this.log('letter: ' + letter);

    const rotorsDirect = this.encodeWithRotors(letter);
    const reflectorInverse = this.reflector.encode(rotorsDirect);
    this.log('reflectorInverse: ' + rotorsDirect + ' -> ' + reflectorInverse);

    const rotorsInverse = this.encodeInverseWithRotors(reflectorInverse);

    return rotorsInverse;
  };

  encodeWithRotors(letter) {
    let output;
    for (let i = 0; i < this.rotors.length; i++) {
      output = this.rotors[i].encode(letter);
      this.log('rotor ' + i + ' direct: ' + letter + ' -> ' + output);
      letter = output;
    }
    return output;
  };

  encodeInverseWithRotors(letter) {
    let output;
    for (let i = this.rotors.length - 1; i >= 0; i--) {
      output = this.rotors[i].encode(letter, true);
      this.log('rotor ' + i + ' inverse: ' + letter + ' -> ' + output);
      letter = output;
    }
    return output;
  };

  encodeLetters(letters) {
    let result = '';
    for (let i = 0; i < letters.length; i++) {
      result += this.encode(letters[i]);
    }
    return result;
  };
}

if (typeof module !== 'undefined') {
  module.exports = {
    Rotor: Rotor,
    RotorI: RotorI,
    RotorII: RotorII,
    RotorIII: RotorIII,
    RotorIV: RotorIV,
    RotorV: RotorV,
    Reflector: Reflector,
    ReflectorB: ReflectorB,
    ReflectorC: ReflectorC,
    Machine: Machine
  };
}