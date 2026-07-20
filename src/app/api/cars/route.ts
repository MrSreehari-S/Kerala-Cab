import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCarsCached } from "@/lib/data/cars";
import { getCarsPaginated } from "@/lib/data/cars";

// Prevent Next.js from statically caching this route at the HTTP layer.
// The intentional data-layer cache lives inside getCarsCached (unstable_cache).
export const dynamic = "force-dynamic";

/** GET /api/cars — public, supports paginated + filtered queries */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const page = searchParams.get("page");
  const limit = searchParams.get("limit");
  const category = searchParams.get("category");
  const sort = searchParams.get("sort");
  const q = searchParams.get("q");

  // If any pagination/filter params are provided, use server-side pagination
  const hasPaginationParams = page || limit || category || sort || q;

  if (hasPaginationParams) {
    const result = await getCarsPaginated({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 8,
      category: category || "all",
      sort: sort || "price-asc",
      q: q || "",
    });

    if (result.dbError) {
      return NextResponse.json(
        { error: "Failed to fetch cars" },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  }

  // Legacy: return all cars (used by admin dashboard refresh)
  const { cars, dbError } = await getCarsCached();
  if (dbError) {
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
  return NextResponse.json(cars);
}

/** POST /api/cars — admin only, create a new car */
export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const db = await getDb();

    // Standardized document without legacy `id` field (MongoDB auto-generates _id)
    const doc = {
      name: body.name,
      slug: body.slug,
      category: body.category,
      tagline: body.tagline,
      pricePerDay: Number(body.pricePerDay),
      transmission: body.transmission,
      fuelType: body.fuelType,
      seats: Number(body.seats),
      images: body.images || [],
      isChauffeurOnly: body.isChauffeurOnly || false,
      features: body.features || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("cars").insertOne(doc);
    const insertedId = result.insertedId.toString();

    revalidateTag("cars", "max");
    revalidatePath("/");
    revalidatePath("/fleet");

    return NextResponse.json(
      { ...doc, id: insertedId, _id: insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cars error:", error);
    return NextResponse.json(
      { error: "Failed to create car" },
      { status: 500 }
    );
  }
}
