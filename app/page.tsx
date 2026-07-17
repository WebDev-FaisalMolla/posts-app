"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/posts");

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadPosts();
  }, []);

  async function savePost() {
    if (!title.trim()) return;

    setLoading(true);

    try {
      const isEditing = !!editingId;

      const res = await fetch("/api/posts", {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingId,
          title,
          content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save post");
      }

      const post = await res.json();

      if (isEditing) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      } else {
        setPosts((prev) => [post, ...prev]);
      }

      setTitle("");
      setContent("");
      setEditingId(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete post");
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));

      // Reset form if the deleted post was being edited
      if (editingId === id) {
        setEditingId(null);
        setTitle("");
        setContent("");
      }
    } catch (error) {
      console.error(error);
    }
  }

  function editPost(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
            Posts
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Share your thoughts with the world.
          </p>
        </header>

        {/* Form */}
        <section className="w-full max-w-2xl rounded-xl border border-white/10 bg-zinc-900 p-5 sm:p-6">
          <h2 className="mb-5 text-xl font-bold">
            {editingId ? "Update Post" : "Create a Post"}
          </h2>

          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded-lg border bg-zinc-800 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write something..."
              rows={5}
              className="w-full resize-none rounded-lg border bg-zinc-800 px-4 py-3 outline-none transition focus:border-blue-500"
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={savePost}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? editingId
                    ? "Updating..."
                    : "Posting..."
                  : editingId
                    ? "Update"
                    : "Post"}
              </button>

              {editingId && (
                <button
                  onClick={cancelEdit}
                  className="rounded-lg bg-zinc-700 px-5 py-3 font-semibold transition hover:bg-zinc-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Posts */}
        <section>
          {posts.length === 0 ? (
            <div className="py-20 text-center text-white/40">No posts yet.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  onClick={() =>
                    window.innerWidth < 768 &&
                    setActivePost((prev) => (prev === post.id ? null : post.id))
                  }
                  className="
                      group
                      bg-zinc-900
                      border border-white/10
                      rounded-xl
                      p-5
                      hover:border-white/20
                      transition
                      cursor-pointer
                      md:cursor-default
                    "
                >
                  <div>
                    <h3 className="mb-3 wrap-break-words text-xl font-bold">
                      {post.title}
                    </h3>

                    <p className="wrap-break-words text-white/70">
                      {post.content
                        ? post.content[0].toUpperCase() + post.content.slice(1)
                        : "No content"}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <time className="text-xs text-white/40">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </time>

                    <div
                      className={`
    flex gap-4
    transition-opacity
    md:opacity-0 md:group-hover:opacity-100
    ${
      activePost === post.id
        ? "opacity-100"
        : "opacity-0 pointer-events-none md:pointer-events-auto"
    }
  `}
                    >
                      <button
                        onClick={() => editPost(post)}
                        className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-sm font-medium text-red-400 transition hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
