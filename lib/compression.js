const zlib = require('zlib');
const snappy = require('snappyjs');
const zstd = require('@bokuweb/zstd-wasm')
zstd.init()

const PARQUET_COMPRESSION_METHODS = {
  'UNCOMPRESSED': {
    deflate: deflate_identity,
    inflate: inflate_identity
  },
  'GZIP': {
    deflate: deflate_gzip,
    inflate: inflate_gzip
  },
  'SNAPPY': {
    deflate: deflate_snappy,
    inflate: inflate_snappy
  },
  'ZSTD': {
    deflate: deflate_zstd,
    inflate: inflate_zstd
  }
};

/**
 * Deflate a value using compression method `method`
 */
function deflate(method, value) {
  if (!(method in PARQUET_COMPRESSION_METHODS)) {
    throw 'invalid compression method: ' + method;
  }

  return PARQUET_COMPRESSION_METHODS[method].deflate(value);
}

function deflate_identity(value) {
  return value;
}

function deflate_gzip(value) {
  return zlib.gzipSync(value);
}

function deflate_snappy(value) {
  return snappy.compress(value);
}

function deflate_zstd(value) {
  return zstd.compress(value);
}

/**
 * Inflate a value using compression method `method`
 */
function inflate(method, value) {
  if (!(method in PARQUET_COMPRESSION_METHODS)) {
    throw 'invalid compression method: ' + method;
  }

  return PARQUET_COMPRESSION_METHODS[method].inflate(value);
}

function inflate_identity(value) {
  return value;
}

function inflate_gzip(value) {
  return zlib.gunzipSync(value);
}

function inflate_snappy(value) {
  return Buffer.from(snappy.uncompress(value));
}

function inflate_zstd(value) {
  return Buffer.from(zstd.decompress(value));
}


module.exports = { PARQUET_COMPRESSION_METHODS, deflate, inflate };
