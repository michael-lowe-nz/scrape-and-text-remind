const examplePhoneNumber = "+18005550100";

export default {
  Test: {
    Teams: [
      {
        Name: "Los Angeles Lakers",
        ScheduleURL:
          "https://websites.mygameday.app/team_info.cgi?c=0-2854-0-633233-27116561&a=SFIX",
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
