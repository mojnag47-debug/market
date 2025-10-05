declare module 'supertest' {
  import { Application } from 'express';
  function supertest(app: Application): any;
  namespace supertest {}
  export default supertest;
}
