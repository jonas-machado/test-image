const express = require("express");
const sharp = require("sharp");
const ssim = require("ssim");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Function to resize the image
async function resizeImage(imageBuffer, targetWidth, targetHeight) {
  return await sharp(imageBuffer).resize(targetWidth, targetHeight).toBuffer();
}

// Function to calculate similarity using SSIM
function calculateSimilarity(imageBuffer1, imageBuffer2) {
  const image1 = sharp(imageBuffer1);
  const image2 = sharp(imageBuffer2);
  return ssim.compareSync(image1, image2);
}

// Compare the image with the database
function compareImages(imageBuffer, database) {
  return database.map((dbImage) => {
    const similarityScore = calculateSimilarity(imageBuffer, dbImage.buffer);
    return { image_path: dbImage.path, similarity_score: similarityScore };
  });
}

// Sample image database (add your own images here)
const imageDatabase = [
  { path: "assets/bait2", buffer: sharp("assets/bait2").toBuffer() },
  {
    path: "https://ae01.alicdn.com/kf/H71bf36b8d46941b9adaec4b9bad2ea50g/Wireless-wifi-router-vpn-300mbps-repetidor-de-firewall-um-clique-wps-wds-4-sid-porta-ethernet.jpg",
    buffer: sharp(
      "https://ae01.alicdn.com/kf/H71bf36b8d46941b9adaec4b9bad2ea50g/Wireless-wifi-router-vpn-300mbps-repetidor-de-firewall-um-clique-wps-wds-4-sid-porta-ethernet.jpg"
    ).toBuffer(),
  },
  {
    path: "https://img.etimg.com/photo/msid-100191616/tp-link-n300.jpg",
    buffer: sharp(
      "https://img.etimg.com/photo/msid-100191616/tp-link-n300.jpg"
    ).toBuffer(),
  },
  {
    path: "https://img.etimg.com/photo/msid-100191616/tp-link-n300.jpg",
    buffer: sharp(
      "https://img.etimg.com/photo/msid-100191616/tp-link-n300.jpg"
    ).toBuffer(),
  },
  {
    path: "https://media.wired.com/photos/6311133e567860ab6c66c672/4:3/w_1888,h_1416,c_limit/Synology-RT6600ax-Gear.jpg",
    buffer: sharp(
      "https://media.wired.com/photos/6311133e567860ab6c66c672/4:3/w_1888,h_1416,c_limit/Synology-RT6600ax-Gear.jpg"
    ).toBuffer(),
  },
  { path: "assets/bait3", buffer: sharp("assets/bait3").toBuffer() },

  // Add more images to the database as needed
];

// Route to compare images
app.post("/api/compare_images", async (req, res) => {
  try {
    const { image_data, target_width, target_height } = req.body;
    const imageBuffer = Buffer.from(image_data, "base64");

    // Resize the image to the target dimensions
    const resizedImage = await resizeImage(
      imageBuffer,
      target_width,
      target_height
    );

    // Compare the resized image with the database
    const similarityScores = compareImages(resizedImage, imageDatabase);

    // Sort the results based on similarity score (higher similarity first)
    similarityScores.sort((a, b) => b.similarity_score - a.similarity_score);

    res.json(similarityScores);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
