import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// בדיקה האם יש את כל הרכיבים בנפרד
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASS || !process.env.DB_NAME) {
  // אם לא נמצאו, זרוק שגיאה עם השמות הנכונים
  throw new Error("Missing required database environment variables (DB_HOST, DB_USER, DB_PASS, DB_NAME).");
}

// בנה את ה-URL מתוך הרכיבים הנפרדים, עם פורט 5432
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`;

export const db = drizzle({
  connection: connectionString, // משתמש ב-URL שבנינו
  schema,
  ws: ws,
});