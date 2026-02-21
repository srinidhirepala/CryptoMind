[Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
$path = "c:\Users\Mr\OneDrive\Desktop\Srinidhi\CryptoMind\AI_Crypto_Wallet_Dashboard_PRD.docx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.GetEntry("word/document.xml")
if ($entry) {
    $stream = $entry.Open()
    $reader = New-Object IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    # Remove XML tags and multiple spaces
    $text = $xml -replace '<w:p(?: [^>]*)?>', "`n" # Add newlines for paragraphs
    $text = $text -replace '<[^>]+>', ''
    $text > "c:\Users\Mr\OneDrive\Desktop\Srinidhi\CryptoMind\PRD_text.txt"
}
$zip.Dispose()
