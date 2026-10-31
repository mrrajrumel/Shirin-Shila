import fs from 'fs';
import path from 'path';
import {
  getMediaManifest,
  uploadMediaAsset,
  checkMediaUsage,
  deleteMediaAsset,
  bulkDeleteMediaAssets,
  scanAndIndexExistingMedia,
} from '../src/lib/media-service';

// Minimal 1x1 transparent PNG buffer
const VALID_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Safe SVG generator
function makeSvg(content: string) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text>${content}</text></svg>`
  );
}

async function runTests() {
  console.log('--- STARTING MEDIA LIBRARY & BULK DELETION VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Upload test asset 1
    const buffer1 = makeSvg('Asset 1 ' + Date.now());
    const uploadRes1 = await uploadMediaAsset({
      buffer: buffer1,
      originalFilename: 'test_asset_one.svg',
      folder: 'testing',
    });
    assert(Boolean(uploadRes1.asset && uploadRes1.asset.id.length > 0), '1. Upload test asset 1 succeeded');
    const asset1 = uploadRes1.asset;

    // 2. Upload test asset 2
    const buffer2 = makeSvg('Asset 2 ' + Date.now());
    const uploadRes2 = await uploadMediaAsset({
      buffer: buffer2,
      originalFilename: 'test_asset_two.svg',
      folder: 'testing',
    });
    assert(Boolean(uploadRes2.asset && uploadRes2.asset.id.length > 0), '2. Upload test asset 2 succeeded');
    const asset2 = uploadRes2.asset;

    // 3. Upload test asset 3
    const buffer3 = makeSvg('Asset 3 ' + Date.now());
    const uploadRes3 = await uploadMediaAsset({
      buffer: buffer3,
      originalFilename: 'test_asset_three.svg',
      folder: 'testing',
    });
    assert(Boolean(uploadRes3.asset && uploadRes3.asset.id.length > 0), '3. Upload test asset 3 succeeded');
    const asset3 = uploadRes3.asset;

    // 4. Verify manifest contains all 3
    let manifest = await getMediaManifest();
    assert(
      manifest.some((a) => a.id === asset1.id) &&
      manifest.some((a) => a.id === asset2.id) &&
      manifest.some((a) => a.id === asset3.id),
      '4. Manifest contains newly uploaded test assets'
    );

    // 5. Test single delete by ID (asset1)
    const delRes1 = await deleteMediaAsset(asset1.id, false);
    assert(delRes1.success === true, '5. deleteMediaAsset by ID succeeded');
    manifest = await getMediaManifest();
    assert(!manifest.some((a) => a.id === asset1.id), '5b. Asset 1 removed from manifest');

    // 6. Test single delete by URL (asset2)
    const delRes2 = await deleteMediaAsset(asset2.url, false);
    assert(delRes2.success === true, '6. deleteMediaAsset by URL succeeded (rescan/resilience test)');
    manifest = await getMediaManifest();
    assert(!manifest.some((a) => a.id === asset2.id), '6b. Asset 2 removed from manifest');

    // 7. Test bulk delete on asset3 and newly uploaded asset4 & asset5
    const buffer4 = makeSvg('Asset 4 ' + Date.now());
    const uploadRes4 = await uploadMediaAsset({
      buffer: buffer4,
      originalFilename: 'test_asset_four.svg',
      folder: 'testing',
    });
    const asset4 = uploadRes4.asset;

    const buffer5 = makeSvg('Asset 5 ' + Date.now());
    const uploadRes5 = await uploadMediaAsset({
      buffer: buffer5,
      originalFilename: 'test_asset_five.svg',
      folder: 'testing',
    });
    const asset5 = uploadRes5.asset;

    const bulkRes = await bulkDeleteMediaAssets([asset3.id, asset4.id, asset5.id], false);
    assert(bulkRes.success === true, '7. bulkDeleteMediaAssets succeeded');
    assert(bulkRes.deletedCount === 3, '7b. bulkDelete deletedCount is exactly 3');

    manifest = await getMediaManifest();
    assert(
      !manifest.some((a) => a.id === asset3.id || a.id === asset4.id || a.id === asset5.id),
      '7c. All 3 assets removed from manifest after bulk delete'
    );

    // 8. Test delete fallback with physical orphan file in uploads
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const orphanFilename = 'orphan_test_' + Date.now() + '.svg';
    const orphanPath = path.join(uploadsDir, orphanFilename);
    fs.writeFileSync(orphanPath, '<svg><rect/></svg>');
    assert(fs.existsSync(orphanPath), '8. Physical orphan file created');

    const orphanDelRes = await deleteMediaAsset('/uploads/' + orphanFilename, true);
    assert(orphanDelRes.success === true, '8b. Orphan file successfully deleted by URL path');
    assert(!fs.existsSync(orphanPath), '8c. Orphan file physically removed from disk');

    console.log(`\n--- MEDIA LIBRARY VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED ---`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
