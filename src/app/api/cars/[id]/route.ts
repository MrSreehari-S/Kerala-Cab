import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** PUT /api/cars/[id] — admin only, update a car */
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

    // Try matching by MongoDB _id first, fall back to custom id field
    let filter: Record<string, unknown>;
    if (ObjectId.isValid(id) && id.length === 24) {
      filter = { _id: new ObjectId(id) };
    } else {
      filter = { id: id };
    }

    const result = await db
      .collection("cars")
      .updateOne(filter, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/fleet");

    return NextResponse.json({ success: true, ...updateDoc });
  } catch (error) {
    console.error("PUT /api/cars/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update car" },
      { status: 500 }
    );
  }
}

/** DELETE /api/cars/[id] — admin only, delete a car */
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
    const db = await getDb();

    let filter: Record<string, unknown>;
    if (ObjectId.isValid(id) && id.length === 24) {
      filter = { _id: new ObjectId(id) };
    } else {
      filter = { id: id };
    }

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
