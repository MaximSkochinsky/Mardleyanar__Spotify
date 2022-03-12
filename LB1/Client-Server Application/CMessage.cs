using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Client_Server_Application
{
    [SerializableAttribute]
    public class CMessage
    {
        public int Id { get; set; }
        public DateTime Time { get; set; }
        public string Message { get; set; }

        public CMessage()
        {
            Time = DateTime.Now;
        }



    }
}
