using Client_Server_Application;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace Client
{
    internal class Program
    {
        static void Main(string[] args)
        {
            const string ipAddress = "127.0.0.1";
            const int port = 8082;
            const int remotePort = 8081;
            int messageId = 0;
            var endPoint = new IPEndPoint(IPAddress.Parse(ipAddress), port);
            var socketUDP = new Socket(AddressFamily.InterNetwork, SocketType.Dgram, ProtocolType.Udp);

            try
            {
                #region TCPClient
                //while (true)
                //{
                //    var endPoint = new IPEndPoint(IPAddress.Parse(ipAddress), port);
                //    var socketTCP = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

                //    Console.WriteLine("Enter your message:");
                //    messageId++;
                //    var message = new CMessage() { Message = Console.ReadLine(), Id = messageId };

                //    var data = CustomConverter.Serialize(message);

                //    socketTCP.Connect(endPoint);
                //    socketTCP.Send(data);

                //    var buffer = new byte[256];
                //    var size = 0;
                //    var answer = new StringBuilder();

                //    do
                //    {
                //        size = socketTCP.Receive(buffer);
                //        answer.Append(Encoding.Unicode.GetString(buffer, 0, size));

                //    }
                //    while (socketTCP.Available > 0);

                //    Console.WriteLine(answer.ToString());

                //    socketTCP.Shutdown(SocketShutdown.Both);
                //    socketTCP.Close();

                //    if (message.Message == "exit")
                //        break;
                //}
                #endregion

                

                socketUDP.Bind(endPoint);

                while (true)
                {
                    Console.WriteLine("Enter your message:");
                    messageId++;
                    var message = new CMessage() { Message = Console.ReadLine(), Id = messageId };

                    var data = CustomConverter.Serialize(message);

                    EndPoint serverEndPoint = new IPEndPoint(IPAddress.Parse(ipAddress), remotePort);

                    socketUDP.SendTo(data, serverEndPoint);

                    var buffer = new byte[500];
                    var size = 0;
                    var answer = new StringBuilder();
                    

                    do
                    {
                        size = socketUDP.ReceiveFrom(buffer, ref serverEndPoint);
                        answer.Append(Encoding.Unicode.GetString(buffer, 0, size));

                    }
                    while (socketUDP.Available > 0);

                    Console.WriteLine(answer.ToString());

                    if (message.Message == "exit")
                        return;

                }

                

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            finally
            {
                socketUDP.Shutdown(SocketShutdown.Both);
                socketUDP.Close();
            }
        }
    }
}
