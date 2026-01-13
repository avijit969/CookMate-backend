import { Context } from "hono";
import db from "../db";
import { logged_in_device } from "../db/schema";
import { and, eq } from "drizzle-orm";

const addLoggedInDevice = async (c: Context) => {
    try {
        const {deviceName,expoPushToken} = await c.req.json();
        const userId = c.get("user").id;
        // check is loggedInDevice already exists
        const loggedInDevice = await db.select()
        .from(logged_in_device)
        .where(and(eq(logged_in_device.userId, userId),eq(logged_in_device.deviceName, deviceName)))
        .execute();
        if(loggedInDevice.length > 0){
            return c.json({message:"Device already exists"},400);
        }
        if(!deviceName || !expoPushToken){
            return c.json({message:"Device name and expo push token are required"},400);
        }
        
        const newDevice = await db.insert(logged_in_device).values({
            userId,
            deviceName,
            expo_push_token:expoPushToken,
        })
        .returning()
        .execute();
        if(!newDevice){
            return c.json({message:"Failed to save device"},500);
        }
        return c.json({message:"Device saved successfully",data:newDevice},201);
    } catch (error) {
        return c.json({message:"Internal Server Error",data:error},500);
    }
}

const getLoggedInDevices = async (c: Context) => {
    try {
        const userId = c.get("user").id;
        const devices = await db.select()
        .from(logged_in_device)
        .where(eq(logged_in_device.userId, userId))
        .execute();
        return c.json({message:"Devices fetched successfully",data:devices},200);
    } catch (error) {
        return c.json({message:"Internal Server Error",data:error},500);
    }
}

const removeLoggedInDevice = async (c: Context) => {
    try {
        const userId = c.get("user").id;
        const {deviceName} = await c.req.json();
        if(!deviceName){
            return c.json({message:"Device name is required"},400);
        }
        // check is device exists
        const device = await db.select()
        .from(logged_in_device)
        .where(and(eq(logged_in_device.userId, userId),eq(logged_in_device.deviceName, deviceName)))
        .execute();
        if(device.length === 0){
            return c.json({message:"Device not found"},404);
        }
        const deletedDevice = await db.delete(logged_in_device)
        .where(and(eq(logged_in_device.userId, userId),eq(logged_in_device.deviceName, deviceName)))
        .returning()
        .execute();
        if(!deletedDevice){
            return c.json({message:"Failed to delete device"},500);
        }
        return c.json({message:"Device deleted successfully",data:deletedDevice},200);
    } catch (error) {
        return c.json({message:"Internal Server Error",data:error},500);
    }
}

export {
    addLoggedInDevice,
    getLoggedInDevices,
    removeLoggedInDevice
}