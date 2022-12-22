const userService = require("../service/user.service");

describe("User Service Unit Tests", function () {
  describe("Save User functionality",async function () {
    it("should successfully add a user if the number of ", async function () {
      let user1 = {
        first_name:"rishu",
        last_name:"singh",
        email: "rishu.singh@gmail.com",
        phone: "7007962760",
        is_active: true,
        is_verified: true,
        is_deleted: false
    }
      const returnedUser = await userService.saveUser(user1);
      console.log("returnedUser ===> ",returnedUser)
      expect(returnedUser.first_name).to.equal(user1.first_name);
      expect(returnedUser.last_name).to.equal(user1.last_name);
      expect(returnedUser.email).to.equal(user1.email);
      expect(returnedUser.phone).to.equal(user1.phone);
      // expect(returnedUser.is_active).to.equal(user1.is_active);
      // expect(returnedUser.is_verified).to.equal(user1.is_verified);
      // expect(returnedUser.is_deleted).to.equal(user1.is_deleted);
    });
  });
  describe("Save User functionality", function () {
    it("should successfully add a user if the number of users in the DB with the same profiled is zero", async function () {
    });
    it("should throw an error if the number of users with the same profileId is not zero", async function () {
    });
  });
});
