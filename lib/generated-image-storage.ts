import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const DEFAULT_BUCKET = "generated-images";
const MAX_GENERATED_PNG_WIDTH = 1280;
const MAX_GENERATED_PNG_HEIGHT = 2000;

async function ensurePublicBucket(
  supabase: SupabaseClient,
  bucket: string,
) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    throw new Error(`Supabase Storage setup failed: ${listError.message}`);
  }

  const existingBucket = buckets.find((item) => item.name === bucket);
  if (!existingBucket) {
    const { error } = await supabase.storage.createBucket(bucket, { public: true });
    if (error) {
      throw new Error(`Supabase Storage bucket creation failed: ${error.message}`);
    }
  } else if (!existingBucket.public) {
    const { error } = await supabase.storage.updateBucket(bucket, { public: true });
    if (error) {
      throw new Error(`Supabase Storage bucket update failed: ${error.message}`);
    }
  }
}

export async function storeGeneratedFile(
  contents: Buffer,
  objectPath: string,
  contentType: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || DEFAULT_BUCKET;

  if (supabaseUrl && serviceRoleKey) {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await ensurePublicBucket(supabase, bucket);

    const { error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, contents, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(
        `Supabase Storage upload failed: ${error.message}`,
      );
    }

    return supabase.storage.from(bucket).getPublicUrl(objectPath).data.publicUrl;
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Generated image storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.",
    );
  }

  const fullPath = path.join(process.cwd(), "public", "generated", objectPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, contents);
  return `/generated/${objectPath.replaceAll("\\", "/")}`;
}

export async function storeGeneratedImage(
  image: Buffer,
  objectPath: string,
): Promise<string> {
  const optimized = await sharp(image)
    .rotate()
    .resize({
      width: MAX_GENERATED_PNG_WIDTH * 2, // Support retina resolutions
      height: MAX_GENERATED_PNG_HEIGHT * 2,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 85,
      effort: 6,
      smartSubsample: true
    })
    .toBuffer();

  return storeGeneratedFile(optimized, objectPath.replace(/\.png$/, '.webp'), "image/webp");
}
