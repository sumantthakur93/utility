/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpClient } from "../client";
import nock from "nock";
import * as util from "../retry-condition";

jest.setTimeout(100000000);
describe("HttpClient", () => {
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it("should create", () => {
    const client = new HttpClient({ baseUrl: "/test" });
    expect(client).toBeTruthy();
  });

  it("should resolve if data is returned", async () => {
    const client = new HttpClient({
      baseUrl: "http://www.test.com",
      enableLogging: false,
    });
    const fakeResp = "Mock Api works";
    const _scope = nock("http://www.test.com")
      .get("/test")
      .reply(200, fakeResp);
    const resp = await client.get({ url: "/test" });
    expect(resp.data).toBe(fakeResp);
  });

  describe("when there is an error", () => {
    // Axios 1.x has an error
    it("should call shouldRetry with the request state and error", async () => {
      const client = new HttpClient({
        baseUrl: "http://www.test.com",
        enableLogging: false,
      });
      const fakeResp = { key: "test" };
      const _scope = nock("http://www.test.com")
        .get("/test")
        .replyWithError(fakeResp);
      nock("http://www.test.com").get("/test").reply(200, fakeResp);
      const spy = jest.spyOn(util, "shouldRetry");

      const resp = await client.get({ url: "/test" });
      expect(spy).toBeCalled();
      expect(resp.data).toStrictEqual({ key: "test" });
    });
  });
});
