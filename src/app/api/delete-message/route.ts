import UserModel from '@/models/User.model';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

export async function DELETE(req: Request,
    { params }: { params: { messageid: string } }) { 
    const messageId = params.messageid;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const _user: User = session?.user as User;

    if(!session || !_user) {
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, { status: 401 });
    }

    try {
        const updateResult = await UserModel.updateOne({
            _id: _user._id,
            "messages._id": messageId
        }, {
            $pull: {
                messages: {
                    _id: messageId
                }
            }
        });

        if(updateResult.modifiedCount === 0) {
            return Response.json({
                success: false,
                message: "Message not found"
            }, { status: 404 });
        }

        return Response.json({
            success: true,
            message: "Message Deleted"
        }, { status: 200 });
        
    } catch (error) {
        console.error('Error Deleting Messages:', error);
        return Response.json({
            success: false,
            message: "Error in Deleting Messages",
            error: error
        }, { status: 500 });
        
    }
}