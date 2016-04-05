export default [
  {
    name: "De Morgan",
    data: {
      langId: "math",
      term: "(P ∧ Q), ¬(¬P ∨ ¬Q)",
    },
  },
  {
    name: "Invalid Cycle",
    data: {
      langId: "c_bitwise",
      term: "A = P & Q, P = R | S, R = A",
    },
  },
  {
    name: "Dependencies",
    data: {
      langId: "c_bitwise",
      term: "A = P & Q, B = P | Q, C = A ^ B",
    },
  },
  {
    name: "Vector",
    data: {
      langId: "c_bitwise",
      term: "Y1 = <X1, X2, X3: 10011101>",
    },
  },
  {
    name: "Vector (Dont-Care)",
    data: {
      langId: "c_bitwise",
      term: "Y1 = <X1, X2, X3: 1**1010*>",
    },
  },

];
