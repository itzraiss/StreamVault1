sub init()
    m.video = m.top.findNode("video")
    m.top.ObserveField("url", "onUrl")
end sub

sub onUrl()
    url = m.top.url
    if url = invalid or url = "" then return
    content = CreateObject("roSGNode", "ContentNode")
    item = CreateObject("roSGNode", "ContentNode")
    item.streamFormat = GetStreamFormat(url)
    item.url = url
    content.AppendChild(item)
    m.video.content = content
    m.video.control = "play"
end sub

function GetStreamFormat(url as String) as String
    if Instr(1, LCase(url), ".m3u8") > 0 then return "hls"
    if Instr(1, LCase(url), ".mp4") > 0 then return "mp4"
    return "mp4"
end function