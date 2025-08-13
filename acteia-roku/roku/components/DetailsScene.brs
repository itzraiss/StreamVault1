sub init()
    m.title = m.top.findNode("title")
    m.synopsis = m.top.findNode("synopsis")
    m.episodes = m.top.findNode("episodes")
    m.playBtn = m.top.findNode("playBtn")
    m.closeBtn = m.top.findNode("closeBtn")

    m.playBtn.ObserveField("buttonSelected", "onPlay")
    m.closeBtn.ObserveField("buttonSelected", "onClose")

    m.top.ObserveField("slug", "onSlug")
end sub

sub onSlug()
    slug = m.top.slug
    if slug = invalid or slug = "" then return
    details = ApiGet("/api/title/" + slug)
    if details = invalid then return

    m.title.text = details.item.title
    if details.synopsis <> invalid then m.synopsis.text = details.synopsis

    if details.episodes <> invalid and details.episodes.Count() > 0 then
        ' Show episodes row
        row = CreateObject("roSGNode", "ContentNode")
        row.Title = "Episódios"
        for each ep in details.episodes
            epNode = CreateObject("roSGNode", "ContentNode")
            posterUrl = ""
            if details.item.poster <> invalid and details.item.poster.url <> invalid then
                posterUrl = GetBackendBaseUrl() + "/api/image?url=" + UrlEncode(details.item.poster.url) + "&w=300&q=78"
            end if
            epNode.SetFields({
                title: ep.title,
                slug: details.item.slug,
                episodeId: ep.id,
                hdPosterUrl: posterUrl
            })
            row.AppendChild(epNode)
        end for
        content = CreateObject("roSGNode", "ContentNode")
        content.AppendChild(row)
        m.episodes.content = content
        m.episodes.visible = true
        m.episodes.ObserveField("itemSelected", "onEpisodeSelected")
    else
        m.episodes.visible = false
    end if
end sub

sub onPlay()
    slug = m.top.slug
    StartPlayback(slug, invalid)
end sub

sub onEpisodeSelected()
    sel = m.episodes.itemSelected
    row = sel[0]
    col = sel[1]
    item = m.episodes.content.GetChild(row).GetChild(col)
    StartPlayback(item.slug, item.episodeId)
end sub

sub StartPlayback(slug as String, episodeId as Dynamic)
    url = "/api/stream/" + slug
    if episodeId <> invalid then url = url + "?episode=" + episodeId
    data = ApiGet(url)
    if data = invalid or data.streams = invalid or data.streams.Count() = 0 then return

    stream = data.streams[0]
    player = CreateObject("roSGNode", "VideoPlayerScene")
    player.url = stream.url
    m.top.getScene().AppendChild(player)
    player.visible = true
end sub

sub onClose()
    m.top.visible = false
    m.top.RemoveChild(m.top)
end sub