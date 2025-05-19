import dbConnect from "@/lib/dbConnect";
import TopicModel from "@/models/Topic.model";

export async function GET(req: Request) {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
        return Response.json({
            success: false,
            message: "Slug Required"
        }, { status: 400 });
    }

    try {
        const topic = await TopicModel.findOne({ slug }).exec();

        if (!topic) {
      return Response.json(
        { success: false, message: "Topic not found" },
        { status: 404 }
     );
    }
        return Response.json({ success: true, topic }, { status: 200 });

    } catch (error) {
        console.log("Error finding topic: ", error);
        return Response.json({
            success: false, message: "Error in Fetching Topic", error
        }, { status: 500 });
    }
}