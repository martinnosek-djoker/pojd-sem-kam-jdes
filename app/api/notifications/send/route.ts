import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { google } from "googleapis";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID!;
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT!;

interface NotificationPayload {
  title: string;
  body: string;
  type: 'cafe' | 'bakery' | 'trending' | 'event';
  itemId?: number;
}

// Získat OAuth2 access token pro FCM V1 API
async function getAccessToken(): Promise<string> {
  try {
    // Escapovat newline znaky před parsováním
    const cleanedServiceAccount = firebaseServiceAccount.replace(/\\n/g, '\n');
    const serviceAccount = JSON.parse(cleanedServiceAccount);

    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const tokens = await jwtClient.authorize();
    return tokens.access_token || "";
  } catch (error) {
    console.error("Error getting access token:", error);
    throw new Error("Failed to get Firebase access token");
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: NotificationPayload = await request.json();
    const { title, body, type, itemId } = payload;

    if (!title || !body || !type) {
      return NextResponse.json(
        { error: "Title, body, and type are required" },
        { status: 400 }
      );
    }

    if (!firebaseProjectId || !firebaseServiceAccount) {
      return NextResponse.json(
        { error: "Firebase configuration not found" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Získat všechny aktivní tokeny zařízení
    const { data: devices, error: devicesError } = await supabase
      .from("device_tokens")
      .select("token, platform");

    if (devicesError) {
      console.error("Error fetching device tokens:", devicesError);
      return NextResponse.json(
        { error: "Failed to fetch device tokens" },
        { status: 500 }
      );
    }

    if (!devices || devices.length === 0) {
      return NextResponse.json(
        { message: "No devices registered", sentCount: 0 },
        { status: 200 }
      );
    }

    // Získat OAuth2 access token
    const accessToken = await getAccessToken();

    // V1 API endpoint
    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`;

    // Odeslat notifikace na všechna zařízení
    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    for (const device of devices) {
      try {
        // FCM V1 message formát
        const message = {
          message: {
            token: device.token,
            notification: {
              title,
              body,
            },
            data: {
              type,
              itemId: itemId?.toString() || "",
            },
            android: {
              notification: {
                sound: "default",
                icon: "ic_notification",
              },
            },
          },
        };

        const response = await fetch(fcmEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          successCount++;
        } else {
          const errorData = await response.json();
          console.error(`Failed to send to token ${device.token}:`, errorData);

          // Zkontrolovat, zda je token neplatný
          if (
            errorData.error?.message?.includes("not a valid FCM registration token") ||
            errorData.error?.status === "NOT_FOUND" ||
            errorData.error?.status === "INVALID_ARGUMENT"
          ) {
            invalidTokens.push(device.token);
          }

          failureCount++;
        }
      } catch (error) {
        console.error(`Error sending notification to ${device.token}:`, error);
        failureCount++;
      }
    }

    // Odstranit neplatné tokeny
    if (invalidTokens.length > 0) {
      await supabase
        .from("device_tokens")
        .delete()
        .in("token", invalidTokens);

      console.log(`Removed ${invalidTokens.length} invalid tokens`);
    }

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failureCount: failureCount,
      totalDevices: devices.length,
    });
  } catch (error) {
    console.error("Error in send notification endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
