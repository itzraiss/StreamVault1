Function PromptSearch() as String
    port = CreateObject("roMessagePort")
    screen = CreateObject("roKeyboardScreen")
    screen.SetMessagePort(port)
    screen.SetDisplayText("Pesquisar")
    screen.SetMaxLength(100)
    screen.AddButton(1, "OK")
    screen.AddButton(2, "Cancelar")
    screen.Show()

    while true
        msg = wait(0, port)
        if type(msg) = "roKeyboardScreenEvent" then
            if msg.isScreenClosed() then
                exit while
            else if msg.isButtonPressed() then
                idx = msg.GetIndex()
                if idx = 1 then
                    return screen.GetText()
                else if idx = 2 then
                    return ""
                end if
            end if
        end if
    end while
    return screen.GetText()
End Function