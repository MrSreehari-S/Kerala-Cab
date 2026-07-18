import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** PUT /api/cars/[id] — admin only, update a car by _id */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid car ID" }, { status: 400 });
    }

    const body = await request.json();
    const db = await getDb();

    const updateDoc = {
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
      updatedAt: new Date(),
    };

    const filter = { _id: new ObjectId(id) };

    const result = await db
      .collection("cars")
      .updateOne(filter, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/fleet");

    return NextResponse.json({ success: true, id, _id: id, ...updateDoc });
  } catch (error) {
    console.error("PUT /api/cars/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update car" },
      { status: 500 }
    );
  }
}

/** DELETE /api/cars/[id] — admin only, delete a car by _id */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid car ID" }, { status: 400 });
    }

    const db = await getDb();
    const filter = { _id: new ObjectId(id) };

    const result = await db.collection("cars").deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/fleet");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cars/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete car" },
      { status: 500 }
    );
  }
}
