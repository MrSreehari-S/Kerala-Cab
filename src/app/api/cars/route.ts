import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** GET /api/cars — public, returns all cars */
export async function GET() {
  try {
    const db = await getDb();
    const cars = await db
      .collection("cars")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Serialize _id to string for JSON
    const serialized = cars.map((car) => ({
      ...car,
      _id: car._id.toString(),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error("GET /api/cars error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
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

    // Auto-generate an id (max current id + 1)
    const lastCar = await db
      .collection("cars")
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    const nextId = lastCar.length > 0
      ? String(Number(lastCar[0].id || "0") + 1)
      : "1";

    const doc = {
      id: nextId,
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

    revalidatePath("/");
    revalidatePath("/fleet");

    return NextResponse.json(
      { ...doc, _id: result.insertedId.toString() },
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
