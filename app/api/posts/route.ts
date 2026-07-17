import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Post id is required." },
        { status: 400 },
      );
    }

    const post = await prisma.post.delete({
      where: {
        id,
      },
    });

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { message: "Failed to delete post." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, title, content } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Post id is required." },
        { status: 400 },
      );
    }

    const post = await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update post." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, title, content } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Post id is required." },
        { status: 400 },
      );
    }

    const post = await prisma.post.update({
      where: {
        id,
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to update post." },
      { status: 500 },
    );
  }
}
