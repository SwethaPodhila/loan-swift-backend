const request = require("supertest");
const app = require("../app");
const connectDB = require("../config/db");
const mongoose = require("mongoose");

jest.setTimeout(20000);

beforeAll(async () => {
    await connectDB();   // DB connect before tests
});

// CLOSE DB AFTER TESTS
afterAll(async () => {
    await mongoose.connection.close();
});

describe("Admin Auth API", () => {

    const adminData = {
        email: `testadmin${Date.now()}@gmail.com`,
        phone: "9876543210",
        password: "123456",
        confirmPassword: "123456"
    };

    test("Admin should signup successfully", async () => {

        const res = await request(app)
            .post("/auth/admin/signup")
            .send(adminData);

        expect(res.statusCode).toBe(201);

    });

    test("Signup should fail if admin already exists", async () => {

        const res = await request(app)
            .post("/auth/admin/signup")
            .send(adminData);

        expect(res.statusCode).toBe(400);

    });

    test("Admin should login successfully", async () => {

        const res = await request(app)
            .post("/auth/admin/login")
            .send({
                email: adminData.email,
                password: adminData.password
            });

        expect(res.statusCode).toBe(200);

    });

    test("Login should fail with wrong password", async () => {

        const res = await request(app)
            .post("/auth/admin/login")
            .send({
                email: adminData.email,
                password: "wrongpassword"
            });

        expect(res.statusCode).toBe(400);

    });

});
