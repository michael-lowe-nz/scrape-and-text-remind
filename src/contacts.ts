const examplePhoneNumber = "+18005550100";

export default {
  Test: {
    Teams: [
      {
        Name: "Los Angeles Lakers",
        Players: [
          {
            Name: "Shaquille ONeal",
            Number: process.env.TEST_PHONE_NUMBER || examplePhoneNumber,
          },
        ],
      },
    ],
  },
};
