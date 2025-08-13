sub init()
    m.top.functionName = "run"
end sub

sub run()
    url = m.top.url
    method = m.top.method
    headers = m.top.headers
    body = m.top.body

    ut = CreateObject("roUrlTransfer")
    ut.SetUrl(url)
    ut.SetCertificatesFile("common:/certs/ca-bundle.crt")
    ut.InitClientCertificates()

    if headers <> invalid then
        for each k in headers
            ut.AddHeader(k, headers[k])
        end for
    end if

    if method = "POST" then
        ut.SetRequest("POST")
        resp = ut.PostFromString(body)
    else
        ut.SetRequest("GET")
        resp = ut.GetToString()
    end if

    if resp = invalid then
        m.top.error = "request failed"
        m.top.status = 0
        return
    end if

    aa = ParseJson(resp)
    if aa = invalid then
        m.top.error = "invalid json"
        m.top.status = 200
        return
    end if

    m.top.response = aa
    m.top.status = 200
end sub