import fs from "fs";

const BASE_URL = "https://tailieuvnu.com/wp-json/wp/v2/posts";
const PER_PAGE = 100;

async function fetchAllPosts() {
  let page = 1;
  const allPosts: any[] = [];

  while (true) {
    const res = await fetch(`${BASE_URL}?per_page=${PER_PAGE}&page=${page}`);
    if (!res.ok) break;

    const posts = await res.json();
    allPosts.push(...posts);

    const totalPages = Number(res.headers.get("x-wp-totalpages"));
    console.log(`Fetched page ${page}/${totalPages}`);
    if (page >= totalPages) break;
    page++;
  }

  fs.writeFileSync("posts.json", JSON.stringify(allPosts, null, 2));
  console.log("Saved", allPosts.length, "posts");
}

fetchAllPosts();
