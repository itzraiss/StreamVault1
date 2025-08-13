sub init()
    m.rowList = m.top.findNode("rowList")
    m.searchBtn = m.top.findNode("searchBtn")
    m.searchBtn.ObserveField("buttonSelected", "onSearch")

    m.rowList.ObserveField("itemSelected", "onItemSelected")

    m.sections = []
    LoadHome()
end sub

sub LoadHome()
    data = ApiGet("/api/home")
    if data = invalid then return

    rows = []
    if data.featured <> invalid and data.featured.Count() > 0 then
        row = CreateObject("roSGNode", "ContentNode")
        row.Title = "Destaques"
        for each it in data.featured
            itemNode = CreateObject("roSGNode", "ContentNode")
            itemNode.SetFields({
                title: it.title,
                hdPosterUrl: GetPosterUrl(it),
                slug: it.slug
            })
            row.AppendChild(itemNode)
        end for
        rows.push(row)
    end if

    if data.sections <> invalid then
        for each section in data.sections
            row = CreateObject("roSGNode", "ContentNode")
            row.Title = section.title
            for each it in section.items
                itemNode = CreateObject("roSGNode", "ContentNode")
                itemNode.SetFields({
                    title: it.title,
                    hdPosterUrl: GetPosterUrl(it),
                    slug: it.slug
                })
                row.AppendChild(itemNode)
            end for
            rows.push(row)
        end for
    end if

    m.rowList.content = CreateObject("roSGNode", "ContentNode")
    for each r in rows
        m.rowList.content.AppendChild(r)
    end for
end sub

function GetPosterUrl(it as Object) as String
    if it.poster <> invalid and it.poster.url <> invalid then
        ' Use image proxy to ensure suitable sizing for Roku
        return GetBackendBaseUrl() + "/api/image?url=" + UrlEncode(it.poster.url) + "&w=300&q=78"
    end if
    return "" ' fallback
end function

sub onItemSelected()
    sel = m.rowList.itemSelected
    row = sel[0]
    col = sel[1]
    item = m.rowList.content.GetChild(row).GetChild(col)
    slug = item.slug

    details = CreateObject("roSGNode", "DetailsScene")
    details.slug = slug
    m.top.appendChild(details)
    details.visible = true
end sub

sub onSearch()
    q = PromptSearch()
    if q = "" then return
    data = ApiGet("/api/search?q=" + UrlEncode(q))
    if data = invalid then return

    ' Replace first row with search results
    row = CreateObject("roSGNode", "ContentNode")
    row.Title = "Busca: " + q
    for each it in data.items
        itemNode = CreateObject("roSGNode", "ContentNode")
        itemNode.SetFields({
            title: it.title,
            hdPosterUrl: GetPosterUrl(it),
            slug: it.slug
        })
        row.AppendChild(itemNode)
    end for

    content = CreateObject("roSGNode", "ContentNode")
    content.AppendChild(row)
    m.rowList.content = content
end sub