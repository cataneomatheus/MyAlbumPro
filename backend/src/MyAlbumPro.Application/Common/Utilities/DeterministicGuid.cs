using System.Security.Cryptography;
using System.Text;

namespace MyAlbumPro.Application.Common.Utilities;

public static class DeterministicGuid
{
    public static Guid FromString(string input)
    {
        using var provider = SHA256.Create();
        var bytes = provider.ComputeHash(Encoding.UTF8.GetBytes(input));
        var guidBytes = new byte[16];
        Array.Copy(bytes, guidBytes, 16);
        return new Guid(guidBytes);
    }
}
