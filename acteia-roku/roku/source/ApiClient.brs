' Simple API client for GET requests
Function ApiGet(path as String) as Object
    url = GetBackendBaseUrl() + path
    ut = CreateObject("roUrlTransfer")
    ut.SetUrl(url)
    ut.SetCertificatesFile("common:/certs/ca-bundle.crt")
    ut.InitClientCertificates()
    ut.SetRequest("GET")
    response = ut.GetToString()
    if response = invalid then return invalid
    return ParseJson(response)
End Function

Function UrlEncode(s as String) as String
    ut = CreateObject("roUrlTransfer")
    return ut.Escape(s)
End Function