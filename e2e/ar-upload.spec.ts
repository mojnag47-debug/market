import { test, expect } from '@playwright/test';

test('AR upload flow E2E (mock presigned URL)', async ({ request }) => {
  // hit the route to get presigned url
  const res = await request.post('http://localhost:3000/api/ar/upload', {
    data: { productId: 'prod-1', fileType: 'glb', fileSize: 1024 },
  });
  expect(res.ok()).toBeTruthy();
  const json = await res.json();
  expect(json.uploadUrl).toBeTruthy();

  // perform a PUT to the presigned URL with a small mock body
  const put = await request.put(json.uploadUrl, { data: Buffer.from([0x1, 0x2, 0x3]) });
  // Some presigned endpoints return 200 or 204; accept either
  expect([200, 201, 204].includes(put.status())).toBeTruthy();
});
