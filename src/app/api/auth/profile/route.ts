import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifySession, destroySession } from "@/lib/auth";
import bcrypt from "bcryptjs";

/** PUT /api/auth/profile — update email and/or password */
export async function PUT(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { currentPassword, newEmail, newPassword } = body as {
      currentPassword?: string;
      newEmail?: string;
      newPassword?: string;
    };

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to save changes" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection("users");

    // Fetch the logged-in user
    const user = await usersCollection.findOne({ email: session.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {};

    // Apply email change if provided and different
    if (newEmail && newEmail.trim() !== "" && newEmail !== user.email) {
      // Check if email is already taken
      const existingUser = await usersCollection.findOne({ email: newEmail });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use by another user" },
          { status: 400 }
        );
      }
      updates.email = newEmail;
    }

    // Apply password change if provided
    if (newPassword && newPassword.trim() !== "") {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No changes requested" });
    }

    await usersCollection.updateOne({ _id: user._id }, { $set: updates });

    // Since credentials changed, terminate session
    await destroySession();

    return NextResponse.json({
      success: true,
      message: "Credentials updated successfully. Please log in again.",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile settings" },
      { status: 500 }
    );
  }
}
