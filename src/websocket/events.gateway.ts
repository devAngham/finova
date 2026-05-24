import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  /**
   * Handles user joining their personal notification room
   * @param client - The connected socket client
   * @param userId - The user's UUID to create a personal room
   * @returns void — emits 'joined' event back to the client
   */
  @SubscribeMessage('join')
  handleJoin(client: Socket, userId: string): void {
    console.log('User joined:', userId);
    void client.join(`user:${userId}`);
    client.emit('joined', { message: 'Connected successfully' });
  }

  /**
   * Sends a real-time notification to a specific user's room
   * @param userId - The target user's UUID
   * @param event - The event name (e.g. 'transaction.completed')
   * @param data - The payload to send with the event
   * @returns void
   */
  sendNotification(userId: string, event: string, data: any): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Notifies user when a transfer is completed successfully
   * @param userId - The user's UUID
   * @param amount - The transferred amount in USD
   * @returns void — emits 'transaction.completed' event
   */
  transactionCompleted(userId: string, amount: number): void {
    console.log(`Notifying user ${userId} of completed transaction: $${amount}`);
    this.sendNotification(userId, 'transaction.completed', {
      message: `Transfer of $${amount} completed successfully`,
      amount,
    });
  }

  /**
   * Notifies user when a transfer fails
   * @param userId - The user's UUID
   * @param reason - The failure reason message
   * @returns void — emits 'transaction.failed' event
   */
  transactionFailed(userId: string, reason: string): void {
    this.sendNotification(userId, 'transaction.failed', {
      message: `Transfer failed: ${reason}`,
      reason,
    });
  }

  /**
   * Notifies user when their account balance is updated
   * @param userId - The user's UUID
   * @param accountId - The account UUID that was updated
   * @param newBalance - The new balance after the update
   * @returns void — emits 'balance.updated' event
   */
  balanceUpdated(userId: string, accountId: string, newBalance: number): void {
    this.sendNotification(userId, 'balance.updated', {
      message: `Balance updated: $ ${newBalance}`,
      accountId,
      newBalance,
    });
  }
}
