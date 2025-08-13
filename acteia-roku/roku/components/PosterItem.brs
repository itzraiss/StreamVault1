sub init()
    m.poster = m.top.findNode("poster")
    m.label = m.top.findNode("label")
    m.top.ObserveField("itemContent", "onItemContent")
end sub

sub onItemContent()
    item = m.top.itemContent
    if item = invalid then return
    m.poster.uri = item.hdPosterUrl
    m.label.text = item.title
end sub