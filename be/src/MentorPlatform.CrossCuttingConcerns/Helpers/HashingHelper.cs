
using System.Security.Cryptography;
using System.Text;

namespace MentorPlatform.CrossCuttingConcerns.Helpers;

public static class HashingHelper
{
    private const int KeySize = 64;
    private const int Iterations = 350_000;
    private static readonly HashAlgorithmName HashAlgorithm = HashAlgorithmName.SHA512;

    public static string HashData(string data)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(KeySize);

        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(data),
            salt,
            Iterations,
            HashAlgorithm,
            KeySize);
        string hashB64 = Convert.ToBase64String(hash);
        string saltB64 = Convert.ToBase64String(salt);
        return $"{hashB64}.{saltB64}";
    }

    public static bool VerifyData(string data, string storedHash)
    {
        var parts = storedHash.Split('.');
        if (parts.Length != 2)
            return false;

        byte[] hashBytes = Convert.FromBase64String(parts[0]);
        byte[] saltBytes = Convert.FromBase64String(parts[1]);

        byte[] newHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(data),
            saltBytes,
            Iterations,
            HashAlgorithm,
            hashBytes.Length);

        return CryptographicOperations.FixedTimeEquals(newHash, hashBytes);
    }
}